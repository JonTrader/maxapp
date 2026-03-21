import { GoogleGenerativeAI } from '@google/generative-ai';
import { PDFParse } from 'pdf-parse';
import { env } from '../lib/env.js'

const parse = async (buffer) => {
  let parser;
  parser = new PDFParse({ data: buffer });
  const pdfData = await parser.getText();
  const resumeText = pdfData.text;
  if (parser) {
    await parser.destroy();
  }
  return resumeText;
}

export const analyze = async (req, res) => {
  const { jobDescription, applicationId } = req.body;

  if (!req.file && !req.body.resume) {
    return res.status(400).json({ message: 'Resume PDF file is required' });
  }

  if (!jobDescription || !applicationId) {
    return res.status(400).json({ message: 'jobDescription and applicationId are required' });
  }

  try {
    let resumeText;
    if (req.file) {
      resumeText = await parse(req.file.buffer)
    } else {
      resumeText = req.body.resume
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from PDF' });
    }

    // Call Gemini API
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert technical recruiter with 15 years of experience evaluating software engineering candidates.
                    A user will provide you with a job description and the extracted text of their resume.
                    Analyze how well the resume matches the job description and return your response as a strictly valid JSON object with absolutely no markdown, code fences, or explanation outside the JSON.
                    Return a strictly valid JSON object with ONLY these keys (no extra text before or after):
                    {
                      "matchScore": <number 0-100>,
                      "missingKeywords": [<array of strings - key skills or tech missing from resume>],
                      "resumeSuggestions": [<array of 3-5 actionable bullet points to improve resume for this role>],
                      "coverLetterDraft": "<3 paragraphs tailored cover letter>",
                      "verdict": "<1-2 sentence summary of match strength>"
                    }

                    Job Description:
                    ${jobDescription}

                    Resume:
                    ${resumeText}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Parse JSON from response
    let analysisResult;
    try {
      // Try to extract JSON if there's extra text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      analysisResult = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error('Failed to parse Gemini response as JSON', responseText);
      return res.status(500).json({ message: 'AI returned invalid JSON', raw: responseText });
    }

    res.json(analysisResult);
  } catch (err) {
    console.error('AI analyze error', err);
    if (err.message.includes('file too large')) {
      return res.status(400).json({ message: 'File size exceeds 5MB limit' });
    }
    res.status(500).json({ message: 'AI service error', error: err.message });
  }
};
