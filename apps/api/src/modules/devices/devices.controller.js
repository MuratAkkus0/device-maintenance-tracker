import * as devicesService from "./devices.service.js";

export async function list(req, res, next) {
  try {
    const { status, type, page, pageSize } = req.query;
    const result = await devicesService.listDevices({
      status,
      type,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    res.json(await devicesService.getDevice(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    res.status(201).json(await devicesService.createDevice(req.body));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    res.json(await devicesService.updateDevice(Number(req.params.id), req.body));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await devicesService.deleteDevice(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
