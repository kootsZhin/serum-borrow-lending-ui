import { Connection, PublicKey } from "@solana/web3.js";
import { Config } from "./global";
import { OBLIGATION_SIZE, parseObligation, parseReserve, RESERVE_SIZE } from "./models";

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

export async function getObligations(connection: Connection, config: Config, lendingMarket: any) {
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

export function pushIfNotExists(array: any[], item: any) {
    if (array.indexOf(item) === -1) {
        array.push(item);
    }
}