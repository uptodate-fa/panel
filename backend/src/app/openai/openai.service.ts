import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey:
        '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', // This is the default and can be omitted
    });
  }

  async getResponse(prompt: string): Promise<string> {
    const thread = await this.openai.beta.threads.create();

    await this.openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: prompt,
    });

    const run = await this.openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: 'asst_WVXQzFLY7KkJdpHRkVDvVNCz',
    });

    if (run.status === 'completed') {
      const messages = await this.openai.beta.threads.messages.list(
        run.thread_id
      );
      const message = messages.data.shift();
      return message.content[0]['text'].value;
    } else {
      console.error(run.status);
    }
    return;
  }
}
