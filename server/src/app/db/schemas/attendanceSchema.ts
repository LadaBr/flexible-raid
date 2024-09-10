import mongoose from 'mongoose';
import {AttendanceItem} from "../../../../../shared/types";

const { Schema } = mongoose;
const attendanceSchema = new Schema<AttendanceItem>({
    serverId: String,
    userId: String,
    nickname: String,
    classSlug: String,
    className: String,
    specSlug: String,
    specName: String,
    role: String,
    day: Number,
    hour: Number,
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;