import * as staffService from "./staff.service.js";

export async function list(req, res, next) {
  try {
    res.json(await staffService.listStaff());
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    res.json(await staffService.getStaff(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    res.status(201).json(await staffService.createStaff(req.body));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    res.json(await staffService.updateStaff(Number(req.params.id), req.body));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await staffService.deleteStaff(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
