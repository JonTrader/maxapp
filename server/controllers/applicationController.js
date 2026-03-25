import Application from '../models/Application.js';
import { PDFParse } from 'pdf-parse';

export const getAll = async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user._id });
    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getApplication = async (req, res) => {
  try {
    const { id } = req.params
    const app = await Application.findById({_id: id})
    if (!app) {
      return res.status(404).json({ message: 'Application was not found' })
    }
    res.json(app)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const create = async (req, res) => {
  const data = { ...req.body, userId: req.user._id };
  let parser;
  try {
    parser = new PDFParse({ data: req.file.buffer });
    const pdfData = await parser.getText();
    const resumeText = pdfData.text;

    const app = new Application(data);
    app.resumeSnapshot = resumeText
    await app.save();
    res.status(201).json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const update = async (req, res) => {
  try {
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      {
        returnDocument: 'after'
      }
    );
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const remove = async (req, res) => {
  try {
    const app = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
