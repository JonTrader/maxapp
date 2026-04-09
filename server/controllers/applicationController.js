import Application from '../models/Application.js';
import { PDFParse } from 'pdf-parse';
import mongoose from 'mongoose';

const STATUS_ORDER = ['Applied', 'Interview', 'Offer', 'Rejected', 'Saved'];
const DEFAULT_STATUS_PAGE_LIMIT = 20;
const MAX_STATUS_PAGE_LIMIT = 100;

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getCanonicalStatus = (value) => {
  if (typeof value !== 'string') return null;

  const normalized = value.trim().toLowerCase();
  return STATUS_ORDER.find((status) => status.toLowerCase() === normalized) || null;
};

const createStatusSummary = () => (
  STATUS_ORDER.reduce((summary, status) => {
    summary[status] = {
      total: 0,
      items: []
    };

    return summary;
  }, {})
);

export const getAll = async (req, res) => {
  try {
    const apps = await Application.find(
      { userId: req.user._id },
      { resumeSnapshot: 0 }
    )
      .sort({ createdAt: -1 })
      .lean();
    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLatestByStatus = async (req, res) => {
  try {
    const apps = await Application.find(
      { userId: req.user._id },
      { resumeSnapshot: 0 }
    )
      .sort({ createdAt: -1 })
      .lean();

    const statuses = createStatusSummary();

    for (const app of apps) {
      const status = getCanonicalStatus(app.status) || 'Saved';

      statuses[status].total += 1;

      if (statuses[status].items.length < 5) {
        statuses[status].items.push(app);
      }
    }

    res.json({ statuses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const canonicalStatus = getCanonicalStatus(status);

    if (!canonicalStatus) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const parsedPage = Number.parseInt(req.query.page, 10);
    const parsedLimit = Number.parseInt(req.query.limit, 10);

    const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const limit = Number.isNaN(parsedLimit)
      ? DEFAULT_STATUS_PAGE_LIMIT
      : Math.min(Math.max(parsedLimit, 1), MAX_STATUS_PAGE_LIMIT);

    const query = { userId: req.user._id, status: canonicalStatus };
    const total = await Application.countDocuments(query);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const effectivePage = Math.min(page, totalPages);

    const items = await Application.find(query, { resumeSnapshot: 0 })
      .sort({ createdAt: -1 })
      .skip((effectivePage - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      status: canonicalStatus,
      items,
      pagination: {
        page: effectivePage,
        limit,
        total,
        totalPages,
        hasNext: effectivePage < totalPages,
        hasPrev: effectivePage > 1 && total > 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getApplication = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid application id' })
    }

    const app = await Application.findOne({ _id: id, userId: req.user._id })
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

    const createdApp = app.toObject();
    delete createdApp.resumeSnapshot;

    res.status(201).json(createdApp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const update = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application id' });
    }

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
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application id' });
    }

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
