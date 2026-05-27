import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: 'sk-mJo8NzmWEsNp4N4UnFDuYyp83igdxDp3XYmFMz1E6tXmruGaddmwrCrM1RfKGF8H',
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