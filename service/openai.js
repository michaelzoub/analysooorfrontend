import OpenAI from "openai";
const api = process.env.NEXT_PUBLIC_OPENAI_API;

const openai = new OpenAI({
    apiKey: api,
    dangerouslyAllowBrowser: true
});

export async function sendMsgToOpenAI(message) {
    const res = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "Your goal is to predict Twitter trends (with percentages) with the help of tweets sent to you from a STEM community on twitter."
            },
            {
                role: "user",
                content: `Please predict future trends using this one tweet: "${message}". Your goal is to predict Twitter trends (with percentages) with the help of tweets sent to you from a STEM community on twitter. BE TECHNICAL, GIVE ME PERCENTAGES. The community loves the programming language Zig, Space X, Peter Thiel, Elon Musk, AI (including Nvidia, Apple Intelligence, OpenAI, Anthropic Claude), e/acc. Make sure to give exactly 3 predictions with likeliness at the end (these all have to add up to %100). BE SHORT AND CONCISE. SEPARATE THE PREDICTION AND THE PERCENTAGE WITH A '-'.`
            }
        ],
        model: "gpt-3.5-turbo-0125",
        max_tokens: 200
    });
    return res.choices[0].message.content;
}