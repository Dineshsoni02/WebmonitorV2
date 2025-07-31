import { messages } from "../constants/responseMessages.js";
import { validateUrl } from "../utils/validation.js";
import WebsiteSchema from "./WebsiteSchema.js";
import axios from "axios";

export const createWebsite = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({
      status: false,
      message: messages.URL_REQUIRED,
    });
  }

  const isValidUrl = validateUrl(url);

  if (!isValidUrl) {
    res.status(422).json({
      status: false,
      message: messages.INVALID_URL,
    });
  }

  const user = req.user;

  const response = await axios.get(url).catch((err) => void err);

  if (!response || response.status !== 200) {
    res.status(422).json({
      status: false,
      message: messages.WEBSITE_NOT_ACTIVE + url,
    });
  }

  const website = await WebsiteSchema.findOne({ url });
  if (website) {
    res.status(422).json({
      status: false,
      message: messages.WEBSITE_ALREADY_EXISTS,
    });
  }

  const newWebsite = new WebsiteSchema({
    url,
    userId: user._id,
    isActive: true,
  });

  newWebsite
    .save()
    .then((web) => {
      res.status(201).json({
        status: true,
        message: messages.WEBSITE_CREATED,
        data: web,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: messages.WEBSITE_CREATION_ERROR,
        error: err,
      });
    });
};

export const deleteWebsite = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({
      status: false,
      message: messages.WEBSITE_ID_REQUIRED,
    });
  }

  WebsiteSchema.deleteOne({ _id: id })
    .then(() => {
      res.status(200).json({
        status: true,
        message: messages.WEBSITE_DELETED,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        message: messages.WEBSITE_DELETION_ERROR,
      });
    });
};

export const getAllWebsite = async (req, res) => {
  const user = req.user;

  const websites = await WebsiteSchema.find({ userId: user._id });

  res.status(200).json({
    status: true,
    message: messages.WEBSITE_FETCHED,
    data: websites,
  });
};

export const x = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({
      status: false,
      message: messages.WEBSITE_ID_REQUIRED,
    });
  }

  const website = await WebsiteSchema.findById(id);
  if (!website) {
    res.status(404).json({
      status: false,
      message: messages.WEBSITE_NOT_FOUND,
    });
  }

  res.status(200).json({
    status: true,
    message: messages.WEBSITE_FETCHED,
    data: website,
  });
};
