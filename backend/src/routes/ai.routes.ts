import { Router, Request, Response } from 'express';
import { aiService } from '../ai/ai.service';

const router = Router();

router.post('/test', async (req: Request, res: Response) => {
  try {
    const {
      systemPrompt = 'You are a helpful AI tutor for school students.',
      prompt = 'Explain fractions to a class 5 student in simple words.',
    } = req.body;

    // Automatic provider selection:
    // NVIDIA = Primary
    // Groq = Fallback
    const response = await aiService.generateAuto({
      systemPrompt,
      userPrompt: prompt,
    });

    res.json({
      success: true,
      data: {
        response: response.content,
        provider: response.provider,
        model: response.model,
        usage: response.usage,
      },
    });
  } catch (error) {
    console.error('[AI Test Error]', error);

    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'AI generation failed',
    });
  }
});

export default router;