"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const pet_controller_1 = require("../controllers/pet.controller");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const attachPet_1 = require("../middlewares/attachPet");
const router = (0, express_1.Router)();
router.get('/explore', async (_req, res, next) => {
    try {
        const { getAllPets } = await Promise.resolve().then(() => __importStar(require('../services/pet.services')));
        const pets = await getAllPets();
        res.json(pets);
    }
    catch (error) {
        next(error);
    }
});
router.get('/search', async (req, res, next) => {
    try {
        const { searchPets } = await Promise.resolve().then(() => __importStar(require('../services/pet.services')));
        const query = req.query.q || '';
        if (!query.trim()) {
            res.json([]);
            return;
        }
        const pets = await searchPets(query);
        res.json(pets);
    }
    catch (error) {
        next(error);
    }
});
router.use(auth_middleware_1.authMiddleware, attachPet_1.attachPet);
router.get('/me', pet_controller_1.myPets);
router.get('/:id', pet_controller_1.getById);
router.post('/', upload_middleware_1.petImage.single('image'), pet_controller_1.create);
router.put('/:id', upload_middleware_1.petImage.single('image'), pet_controller_1.update);
router.delete('/:id', pet_controller_1.remove);
exports.default = router;
