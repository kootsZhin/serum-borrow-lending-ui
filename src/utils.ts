import { Connection, PublicKey } from "@solana/web3.js";
import { Config } from "./global";
import { parseObligation, parseReserve, RESERVE_SIZE, OBLIGATION_SIZE } from "./models";
import { findWhere } from 'underscore';

export async function getReserves(connection: Connection, config: Config, lendingMarket: any) {
    const resp = await connection.getProgramAccounts(new PublicKey(config.programID), {
        commitment: connection.commitment,
        filters: [
            {
                memcmp: {
                    offset: 10,
                    bytes: lendingMarket,
                },
            },
            {
                dataSize: RESERVE_SIZE,
            },
        ],
        encoding: 'base64',
    });

    return resp.map((account) => parseReserve(account.pubkey, account.account));
}

export async function getObligation(connection: Connection, config: Config, lendingMarket: any) {
    const resp = await connection.getProgramAccounts(new PublicKey(config.programID), {
        commitment: connection.commitment,
        filters: [
            {
                memcmp: {
                    offset: 10,
                    bytes: lendingMarket,
                },
            },
            {
                dataSize: OBLIGATION_SIZE,
            },
        ],
        encoding: 'base64',
    });

    return resp.map((account) => parseObligation(account.pubkey, account.account));
}

