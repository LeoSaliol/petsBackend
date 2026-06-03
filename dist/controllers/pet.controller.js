"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getById = exports.remove = exports.update = exports.myPets = exports.create = void 0;
const pet_services_1 = require("../services/pet.services");
const create = async (req, res, next) => {
    try {
        const { name, bio } = req.body;
        const image = req.file?.path;
        if (!name || !image) {
            return res
                .status(400)
                .json({ message: 'Name and image are required' });
        }
        const pet = await (0, pet_services_1.createPet)({
            name,
            bio,
            image,
            ownerId: req.user.id,
        });
        res.status(201).json(pet);
    }
    catch (error) {
        next(error);
    }
};
exports.create = create;
const myPets = async (req, res, next) => {
    try {
        const pets = await (0, pet_services_1.getMyPets)(req.user.id);
        res.json(pets);
    }
    catch (error) {
        next(error);
    }
};
exports.myPets = myPets;
const update = async (req, res, next) => {
    try {
        const petId = Number(req.params.id);
        const { name, bio } = req.body;
        const image = req.file?.path;
        if (!name || !image) {
            return res
                .status(400)
                .json({ message: 'Name and image are required' });
        }
        const pet = await (0, pet_services_1.updatePet)(petId, req.user.id, { name, bio, image });
        res.json(pet);
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
const remove = async (req, res, next) => {
    try {
        const petId = Number(req.params.id);
        await (0, pet_services_1.deletePet)(petId, req.user.id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.remove = remove;
const getById = async (req, res, next) => {
    try {
        const petId = Number(req.params.id);
        const currentPetId = req.petId;
        const pet = await (0, pet_services_1.getPetById)(petId, currentPetId);
        res.json(pet);
    }
    catch (error) {
        next(error);
    }
};
exports.getById = getById;
