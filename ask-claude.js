import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: 'TU_API_KEY_REAL_AQUI',
});

async function main() {
    const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        messages: [{ role: "user", content: process.argv[2] || "Hola" }],
    });
    console.log(message.content[0].text);
}

main();