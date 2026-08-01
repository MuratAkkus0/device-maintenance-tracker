import * as roomsService from "./rooms.service.js";

export async function list(req, res, next) {
  try {
    res.json(await roomsService.listRooms());
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    res.json(await roomsService.getRoom(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    res.status(201).json(await roomsService.createRoom(req.body));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    res.json(await roomsService.updateRoom(Number(req.params.id), req.body));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await roomsService.deleteRoom(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
