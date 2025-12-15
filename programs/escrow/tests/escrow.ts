import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Escrow } from "../target/types/escrow";
import { expect } from "chai";

describe("escrow program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Escrow as Program<Escrow>;

  const creator = provider.wallet as anchor.Wallet;
  const opponent = anchor.web3.Keypair.generate();

  const challengeId = new anchor.BN(1);
  const ticker = "TEST";

  let challengePda: anchor.web3.PublicKey;
  let vaultPda: anchor.web3.PublicKey;

  it("initializes a challenge", async () => {
    [challengePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("challenge"), creator.publicKey.toBuffer(), challengeId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("vault"), challengePda.toBuffer()], program.programId);

    await program.methods
      .initializeChallenge(challengeId, ticker, 0, new anchor.BN(1_000_000), new anchor.BN(Date.now() / 1000 + 600))
      .accounts({
        creator: creator.publicKey,
        oracleAuthority: creator.publicKey,
        challenge: challengePda,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    const account = await program.account.challenge.fetch(challengePda);
    expect(account.creator.equals(creator.publicKey)).to.be.true;
    expect(account.status).to.equal(0);
  });

  it("joins and deposits", async () => {
    await program.methods
      .joinChallenge(1)
      .accounts({
        opponent: opponent.publicKey,
        challenge: challengePda,
        creator: creator.publicKey
      })
      .signers([opponent])
      .rpc();

    // fund opponent
    const sig = await provider.connection.requestAirdrop(opponent.publicKey, 2_000_000);
    await provider.connection.confirmTransaction(sig);

    await program.methods
      .deposit(new anchor.BN(1_000_000))
      .accounts({
        payer: creator.publicKey,
        challenge: challengePda,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    await program.methods
      .deposit(new anchor.BN(1_000_000))
      .accounts({
        payer: opponent.publicKey,
        challenge: challengePda,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([opponent])
      .rpc();

    const account = await program.account.challenge.fetch(challengePda);
    expect(account.status).to.equal(1);
    expect(account.creatorDeposit.toNumber()).to.equal(1_000_000);
    expect(account.opponentDeposit.toNumber()).to.equal(1_000_000);
  });

  it("resolves and pays winner", async () => {
    const before = await provider.connection.getBalance(opponent.publicKey);
    await program.methods
      .resolve(1)
      .accounts({
        authority: creator.publicKey,
        challenge: challengePda,
        creator: creator.publicKey,
        opponent: opponent.publicKey,
        vault: vaultPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    const after = await provider.connection.getBalance(opponent.publicKey);
    expect(after).to.be.greaterThan(before);
    const account = await program.account.challenge.fetch(challengePda);
    expect(account.status).to.equal(2);
  });
});
