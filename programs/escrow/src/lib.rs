use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::solana_program::rent::Rent;

declare_id!("Escrw111111111111111111111111111111111111111");

const STATUS_OPEN: u8 = 0;
const STATUS_LIVE: u8 = 1;
const STATUS_RESOLVED: u8 = 2;
const STATUS_CANCELLED: u8 = 3;
const TICKER_MAX: usize = 32;

#[program]
pub mod escrow {
    use super::*;

    pub fn initialize_challenge(
        ctx: Context<InitializeChallenge>,
        challenge_id: u64,
        ticker: String,
        creator_side: u8,
        stake_lamports: u64,
        enter_by_unix: i64,
    ) -> Result<()> {
        require!(ticker.len() <= TICKER_MAX, EscrowError::TickerTooLong);
        require!(creator_side <= 1, EscrowError::InvalidSide);
        let challenge = &mut ctx.accounts.challenge;
        challenge.creator = ctx.accounts.creator.key();
        challenge.oracle_authority = ctx.accounts.oracle_authority.key();
        challenge.opponent = Pubkey::default();
        challenge.creator_side = creator_side;
        challenge.opponent_side = 0;
        challenge.stake_lamports = stake_lamports;
        challenge.status = STATUS_OPEN;
        challenge.challenge_id = challenge_id;
        challenge.ticker = ticker;
        challenge.result_side = 255;
        challenge.creator_deposit = 0;
        challenge.opponent_deposit = 0;
        challenge.enter_by = enter_by_unix;
        challenge.resolved_at = 0;
        challenge.vault_bump = *ctx.bumps.get("vault").unwrap();

        // create vault PDA owned by program
        let rent = Rent::get()?;
        let vault_lamports = rent.minimum_balance(8);
        let seeds = &[
            b"vault",
            ctx.accounts.challenge.key().as_ref(),
            &[challenge.vault_bump],
        ];
        let ix = system_instruction::create_account(
            &ctx.accounts.creator.key(),
            &ctx.accounts.vault.key(),
            vault_lamports,
            8,
            ctx.program_id,
        );
        invoke_signed(&ix, &[ctx.accounts.creator.to_account_info(), ctx.accounts.vault.to_account_info(), ctx.accounts.system_program.to_account_info()], &[seeds])?;
        Ok(())
    }

    pub fn join_challenge(ctx: Context<JoinChallenge>, opponent_side: u8) -> Result<()> {
        require!(opponent_side <= 1, EscrowError::InvalidSide);
        let challenge = &mut ctx.accounts.challenge;
        require!(challenge.opponent == Pubkey::default(), EscrowError::AlreadyJoined);
        require!(opponent_side != challenge.creator_side, EscrowError::SameSide);
        challenge.opponent = ctx.accounts.opponent.key();
        challenge.opponent_side = opponent_side;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, lamports: u64) -> Result<()> {
        let challenge = &mut ctx.accounts.challenge;
        require!(challenge.status != STATUS_RESOLVED && challenge.status != STATUS_CANCELLED, EscrowError::NotActive);
        let payer = ctx.accounts.payer.to_account_info();
        let vault = ctx.accounts.vault.to_account_info();

        let transfer_ix = system_instruction::transfer(&payer.key(), &vault.key(), lamports);
        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[payer.clone(), vault.clone(), ctx.accounts.system_program.to_account_info()],
        )?;

        if payer.key() == challenge.creator {
            challenge.creator_deposit = challenge.creator_deposit.checked_add(lamports).ok_or(EscrowError::MathOverflow)?;
        } else if payer.key() == challenge.opponent {
            challenge.opponent_deposit = challenge.opponent_deposit.checked_add(lamports).ok_or(EscrowError::MathOverflow)?;
        } else {
            return err!(EscrowError::UnauthorizedDepositor);
        }

        if challenge.creator_deposit >= challenge.stake_lamports && challenge.opponent_deposit >= challenge.stake_lamports {
            challenge.status = STATUS_LIVE;
        }
        Ok(())
    }

    pub fn resolve(ctx: Context<Resolve>, result_side: u8) -> Result<()> {
        require!(result_side <= 1, EscrowError::InvalidSide);
        let challenge = &mut ctx.accounts.challenge;
        require!(challenge.status != STATUS_RESOLVED, EscrowError::AlreadyResolved);
        require!(ctx.accounts.authority.key() == challenge.oracle_authority, EscrowError::Forbidden);
        require!(challenge.status == STATUS_LIVE, EscrowError::NotActive);

        let total = challenge.creator_deposit.checked_add(challenge.opponent_deposit).ok_or(EscrowError::MathOverflow)?;
        let winner_info = if challenge.creator_side == result_side {
            ctx.accounts.creator.to_account_info()
        } else {
            ctx.accounts.opponent.to_account_info()
        };

        let seeds = &[
            b"vault",
            challenge.to_account_info().key.as_ref(),
            &[challenge.vault_bump],
        ];
        let signer = &[&seeds[..]];
        let transfer_ix = system_instruction::transfer(&ctx.accounts.vault.key(), &winner_info.key(), total);
        invoke_signed(
            &transfer_ix,
            &[ctx.accounts.vault.to_account_info(), winner_info, ctx.accounts.system_program.to_account_info()],
            signer,
        )?;

        challenge.status = STATUS_RESOLVED;
        challenge.result_side = result_side;
        challenge.resolved_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
        let challenge = &mut ctx.accounts.challenge;
        require!(challenge.status != STATUS_LIVE, EscrowError::NotCancellable);
        require!(challenge.status != STATUS_RESOLVED, EscrowError::AlreadyResolved);
        challenge.status = STATUS_CANCELLED;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(challenge_id: u64, ticker: String)]
pub struct InitializeChallenge<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    /// CHECK: stored as authority for later validation
    pub oracle_authority: UncheckedAccount<'info>,
    #[account(
        init,
        payer = creator,
        seeds = [b"challenge", creator.key().as_ref(), &challenge_id.to_le_bytes()],
        bump,
        space = 8 + Challenge::LEN
    )]
    pub challenge: Account<'info, Challenge>,
    /// CHECK: created manually to be program-owned vault
    #[account(
        mut,
        seeds = [b"vault", challenge.key().as_ref()],
        bump
    )]
    pub vault: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinChallenge<'info> {
    pub opponent: Signer<'info>,
    #[account(mut, has_one = creator)]
    pub challenge: Account<'info, Challenge>,
    pub creator: SystemAccount<'info>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub challenge: Account<'info, Challenge>,
    /// CHECK: vault owned by program
    #[account(
        mut,
        seeds = [b"vault", challenge.key().as_ref()],
        bump = challenge.vault_bump
    )]
    pub vault: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Resolve<'info> {
    pub authority: Signer<'info>,
    #[account(mut)]
    pub challenge: Account<'info, Challenge>,
    #[account(mut)]
    pub creator: SystemAccount<'info>,
    #[account(mut)]
    pub opponent: SystemAccount<'info>,
    /// CHECK: vault owned by program
    #[account(
        mut,
        seeds = [b"vault", challenge.key().as_ref()],
        bump = challenge.vault_bump
    )]
    pub vault: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Cancel<'info> {
    #[account(mut, has_one = creator)]
    pub challenge: Account<'info, Challenge>,
    pub creator: Signer<'info>,
}

#[account]
pub struct Challenge {
    pub creator: Pubkey,
    pub oracle_authority: Pubkey,
    pub opponent: Pubkey,
    pub creator_side: u8,
    pub opponent_side: u8,
    pub stake_lamports: u64,
    pub status: u8,
    pub challenge_id: u64,
    pub ticker: String,
    pub result_side: u8,
    pub creator_deposit: u64,
    pub opponent_deposit: u64,
    pub enter_by: i64,
    pub resolved_at: i64,
    pub vault_bump: u8,
}

impl Challenge {
    pub const LEN: usize = 32 + 32 + 32 + 1 + 1 + 8 + 1 + 8 + (4 + TICKER_MAX) + 1 + 8 + 8 + 8 + 8 + 1;
}

#[error_code]
pub enum EscrowError {
    #[msg("Invalid side")]
    InvalidSide,
    #[msg("Ticker too long")]
    TickerTooLong,
    #[msg("Already joined")]
    AlreadyJoined,
    #[msg("Opponent cannot take the same side")]
    SameSide,
    #[msg("Challenge not active")]
    NotActive,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Depositor not part of challenge")]
    UnauthorizedDepositor,
    #[msg("Challenge already resolved")]
    AlreadyResolved,
    #[msg("Forbidden")]
    Forbidden,
    #[msg("Challenge cannot be cancelled")]
    NotCancellable,
}
