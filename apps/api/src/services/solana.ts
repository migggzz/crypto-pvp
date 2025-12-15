import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram, Connection } from "@solana/web3.js";
import fs from "fs";
import path from "path";
import { config } from "../config";

type EscrowProgram = anchor.Program<any>;

function loadKeypair(): Keypair {
  if (!config.oracleAuthority) throw new Error("ORACLE_AUTHORITY_KEYPAIR not set");
  if (config.oracleAuthority.trim().startsWith("[")) {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(config.oracleAuthority)));
  }
  const kpPath = path.resolve(config.oracleAuthority);
  const file = fs.readFileSync(kpPath, "utf-8");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(file)));
}

function getConnection() {
  return new Connection(config.solanaRpcUrl, "confirmed");
}

function loadProgram(): EscrowProgram {
  const connection = getConnection();
  const wallet = new anchor.Wallet(loadKeypair());
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  anchor.setProvider(provider);

  const idlPath = path.join(__dirname, "../../../../programs/escrow/target/idl/escrow.json");
  if (!fs.existsSync(idlPath)) {
    throw new Error("IDL not found. Build Anchor program first.");
  }
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
  const programId = new PublicKey(config.programId || idl.metadata.address);
  return new anchor.Program(idl, programId, provider);
}

export async function initializeChallengeOnChain(params: { challengeId: anchor.BN; ticker: string; creatorSide: number; stakeLamports: anchor.BN; enterBy: anchor.BN }) {
  const program = loadProgram();
  const creator = (program.provider as anchor.AnchorProvider).wallet as anchor.Wallet;
  const [challengePda] = PublicKey.findProgramAddressSync([Buffer.from("challenge"), creator.publicKey.toBuffer(), params.challengeId.toArrayLike(Buffer, "le", 8)], program.programId);
  const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vault"), challengePda.toBuffer()], program.programId);
  await program.methods
    .initializeChallenge(params.challengeId, params.ticker, params.creatorSide, params.stakeLamports, params.enterBy)
    .accounts({
      creator: creator.publicKey,
      challenge: challengePda,
      vault: vaultPda,
      systemProgram: SystemProgram.programId
    })
    .rpc();
  return { challengePda: challengePda.toBase58(), vaultPda: vaultPda.toBase58() };
}

export async function joinChallengeOnChain(challengeId: anchor.BN, creator: PublicKey, opponent: Keypair, opponentSide: number) {
  const program = loadProgram();
  const [challengePda] = PublicKey.findProgramAddressSync([Buffer.from("challenge"), creator.toBuffer(), challengeId.toArrayLike(Buffer, "le", 8)], program.programId);
  await program.methods.joinChallenge(opponentSide).accounts({ opponent: opponent.publicKey, challenge: challengePda }).signers([opponent]).rpc();
  return { challengePda: challengePda.toBase58() };
}

export async function depositOnChain(challengeId: anchor.BN, creator: PublicKey, user: Keypair, lamports: anchor.BN) {
  const program = loadProgram();
  const [challengePda] = PublicKey.findProgramAddressSync([Buffer.from("challenge"), creator.toBuffer(), challengeId.toArrayLike(Buffer, "le", 8)], program.programId);
  const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vault"), challengePda.toBuffer()], program.programId);
  await program.methods.deposit(lamports).accounts({ payer: user.publicKey, challenge: challengePda, vault: vaultPda, systemProgram: SystemProgram.programId }).signers([user]).rpc();
  return { vaultPda: vaultPda.toBase58() };
}

export async function resolveOnChain(challengeId: anchor.BN, creator: PublicKey, resultSide: number) {
  const program = loadProgram();
  const authority = loadKeypair();
  const [challengePda] = PublicKey.findProgramAddressSync([Buffer.from("challenge"), creator.toBuffer(), challengeId.toArrayLike(Buffer, "le", 8)], program.programId);
  const [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from("vault"), challengePda.toBuffer()], program.programId);
  await program.methods.resolve(resultSide).accounts({ authority: authority.publicKey, challenge: challengePda, vault: vaultPda }).signers([authority]).rpc();
  return { challengePda: challengePda.toBase58(), vaultPda: vaultPda.toBase58() };
}
