import pkg from "pg";
const { Client } = pkg;

const client = new Client({
    host: "localhost",
    database: "url_shortner",
    port: 5432,
});

console.log("gonna try to connect");

client
    .connect()
    .then(() => {
        console.log("connected to db");
    })
    .catch((error) => console.error(error));

async function getAll() {
    const result = await client.query("SELECT * FROM urls");
    return result.rows;
}

// helper function to generate random 8 char keys
function generateRandomKey() {
    const maxLength = 8;

    // Define characters to choose from for the key
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let key = "";

    // Generate random key with the chosen length
    for (let i = 0; i < maxLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        key += characters.charAt(randomIndex);
    }

    return key;
}

async function createShortUrl(long_url) {
    const inDb = await getShortUrl(long_url);
    const expr_date = "2025-01-01";
    if (inDb) {
        return inDb["key"];
    }
    const key = generateRandomKey();
    const query = {
        text: "INSERT INTO urls (long_url, key, expr_date) VALUES ($1, $2, $3)",
        values: [long_url, key, expr_date],
    };
    client.query(query);
    return key;
}

// gets short_url from long_url
async function getShortUrl(long_url) {
    const result = await client.query(
        `SELECT key FROM urls WHERE long_url = '${long_url}'`
    );
    return result.rows[0];
}

// gets long_url from short
async function getLongUrl(short_url) {
    const result = await client.query(
        `SELECT long_url FROM urls WHERE key = '${short_url}'`
    );
    return result.rows[0]["long_url"];
}
