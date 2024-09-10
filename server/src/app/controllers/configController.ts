import Config from "../db/schemas/configSchema";
import { ObjectId } from 'mongodb';
import {Requirements} from "../../../../shared/types";


export class ConfigController {
    static async create(serverId: string) {
        const config = new Config({
            serverId,
        });
        await config.save();
        return config;
    }

    static exists(serverId: string) {
        return Config.exists({serverId});
    }

    static async get(serverId: string) {
        return Config.findOne({serverId});
    }

    static async disableConfigHours(serverId: string, hours: number[]) {
        return Config.findOneAndUpdate({serverId}, {$addToSet: {disabledHours: hours}});
    }

    static async enableConfigHours(serverId: string, hours: number[]) {
        return Config.findOneAndUpdate({serverId}, {$pull: {disabledHours: {$in: hours}}});
    }

    static async enableConfigDays(serverId: string, days: number[]) {
        return Config.findOneAndUpdate({serverId}, {$pull: {disabledDays: {$in: days}}});
    }

    static async disableConfigDays(serverId: string, days: number[]) {
        return Config.findOneAndUpdate({serverId}, {$addToSet: {disabledDays: days}});
    }

    static async getAll(serverIds: string[]) {
        return Config.find({serverId: {$in: serverIds}});
    }

    static async addRequirements(serverId: string, requirements: Omit<Requirements, '_id'>) {
        return Config.findOneAndUpdate({serverId}, {$push: {requirements}});
    }

    static async removeRequirements(serverId: string, requirementsId: string) {
        return Config.findOneAndUpdate({
            serverId,
        }, {$pull: {requirements: {_id: requirementsId}}});
    }

    static async updateRequirements(serverId: string, requirementsId: string, requirements: Partial<Requirements>) {
        const $set: Partial<Requirements> = {};
        if (requirements.name) $set.name = requirements.name;
        if (requirements.color) $set.color = requirements.color;
        if (requirements.image) $set.image = requirements.image;
        if (requirements.template) $set.template = requirements.template;
        if (requirements.channelId) $set.channelId = requirements.channelId;
        if (requirements.minPlayers) $set.minPlayers = requirements.minPlayers;
        if (requirements.roles && Object.keys(requirements.roles).length) $set.roles = requirements.roles;
        if (requirements.discordRoles && requirements.discordRoles.length > 0) $set.discordRoles = requirements.discordRoles;
        return Config.findOneAndUpdate(
            {serverId, "requirements._id": requirementsId},
            {
                $set: Object.entries($set).reduce((acc, [k, v]) => {
                    acc["requirements.$." + k] = v;
                    return acc;
                }, {} as Record<string, any>)
            }
        );
    }
}