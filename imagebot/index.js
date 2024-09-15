const express = require('express');
const bodyParser = require('body-parser');
const readline = require('readline');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

let conversationHistory = [{
    role: "system",
    content: "META_PROMPT1: Follow the prompt instructions laid out below. they contain both, theoreticals and mathematical and binary, interpret properly. 1. follow the conventions always. 2. the main function is called answer_operator.3. What are you going to do? answer at the beginning of each answer you give."
}];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Setup Express
const app = express();
app.use(bodyParser.json());
const port = 3000;

// Serve the frontend HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Handle generation requests
app.post('/generate', async (req, res) => {
    const { type, prompt } = req.body;

    if (type === 'text') {
        try {
            // Add user message to history
            conversationHistory.push({
                role: "user",
                content: prompt
            });

            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: conversationHistory,
                max_tokens: 128
            });
            const completion = response.choices[0].message.content.trim();

            // Add AI response to history
            conversationHistory.push({
                role: "assistant",
                content: completion
            });

            res.json({ response: completion });
        } catch (error) {
            console.error('Error from OpenAI:', error);
            res.status(500).json({ error: 'Error generating text.' });
        }
    } else if (type === 'image') {
        try {
            const response = await openai.images.generate({
                prompt: prompt,
                n: 1,
                size: '1024x1024'
            });
            const imageUrl = response.data[0].url;
            res.json({ imageUrl: imageUrl });
        } catch (error) {
            console.error('Error from OpenAI:', error);
            res.status(500).json({ error: 'Error generating image.' });
        }
    } else {
        res.status(400).json({ error: 'Invalid generation type.' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Initial welcome statement for command-line interface
console.log("Welcome! Do you want to generate (1) Text or (2) Image? Type 'exit' to quit.");

const askUser = () => {
    rl.question('You: ', async (input) => {
        if (input.toLowerCase() === 'exit') {
            console.log('Goodbye!');
            rl.close();
            return;
        } else if (input === '1') {
            askForTextPrompt();
        } else if (input === '2') {
            askForImagePrompt();
        } else {
            console.log("Please enter '1' for text generation or '2' for image generation.");
            askUser();
        }
    });
};

const askForTextPrompt = () => {
    rl.question('Enter your text prompt: ', async (prompt) => {
        if (prompt.toLowerCase() === 'exit') {
            console.log('Goodbye!');
            rl.close();
            return;
        } else {
            await generateText(prompt);
            askUser();
        }
    });
};

const askForImagePrompt = () => {
    rl.question('Enter your image description: ', async (description) => {
        if (description.toLowerCase() === 'exit') {
            console.log('Goodbye!');
            rl.close();
            return;
        } else {
            await generateImage(description);
            askUser();
        }
    });
};

const generateText = async (prompt) => {
    try {
        // Add user message to history
        conversationHistory.push({
            role: "user",
            content: prompt
        });

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: conversationHistory,
            max_tokens: 128
        });
        const completion = response.choices[0].message.content.trim();

        // Add AI response to history
        conversationHistory.push({
            role: "assistant",
            content: completion
        });

        console.log('AI:', completion);
    } catch (error) {
        console.error('Error from OpenAI:', error);
    }
};

const generateImage = async (description) => {
    try {
        const response = await openai.images.generate({
            prompt: description,
            n: 1,
            size: '1024x1024'
        });
        const imageUrl = response.data[0].url;
        console.log('AI: Here is your generated image:', imageUrl);
    } catch (error) {
        console.error('Error from OpenAI:', error);
    }
};

// Start the conversation for command-line interface
askUser();
