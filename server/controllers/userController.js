import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok, created } from "../utils/apiResponse.js";
import User from "../models/User.js";
import Address from "../models/Address.js";

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  });
  ok(res, { user: user.toSafeJSON() }, "Profile updated");
});

export const listAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  ok(res, { addresses });
});

export const createAddress = asyncHandler(async (req, res) => {
  if (req.body.isDefault) {
    await Address.updateMany(
      { user: req.user._id, type: req.body.type },
      { $set: { isDefault: false } }
    );
  }
  const address = await Address.create({ ...req.body, user: req.user._id });
  created(res, { address }, "Address added");
});

export const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) throw ApiError.notFound("Address not found");

  if (req.body.isDefault) {
    await Address.updateMany(
      { user: req.user._id, type: address.type, _id: { $ne: address._id } },
      { $set: { isDefault: false } }
    );
  }
  Object.assign(address, req.body);
  await address.save();
  ok(res, { address }, "Address updated");
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!address) throw ApiError.notFound("Address not found");
  ok(res, {}, "Address removed");
});
