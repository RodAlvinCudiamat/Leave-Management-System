import { MILLISECONDS_PER_HOUR, REGULAR_WORK_HOURS } from '../config/constants.js';

/**
 * Calculate worked hours between two Date objects
 * @param {Date} time_in 
 * @param {Date} time_out 
 * @returns {number} hours rounded to 2 decimals
 */
export function calculateWorkedHours(time_in, time_out) {
    const raw_hours = (time_out - time_in) / MILLISECONDS_PER_HOUR;
    return Math.round(raw_hours * 100) / 100;
}

/**
 * Determine overtime and undertime
 * @param {number} worked_hours 
 * @returns {object} { overtime: number, undertime: number }
 */
export function calculateOvertimeUndertime(worked_hours) {
    let overtime = 0;
    let undertime = 0;

    if(worked_hours > REGULAR_WORK_HOURS){
        overtime = worked_hours - REGULAR_WORK_HOURS;
    } 
    else if(worked_hours < REGULAR_WORK_HOURS){
        undertime = REGULAR_WORK_HOURS - worked_hours;
    }

    return { overtime, undertime };
}

/**
 * Determine if overtime exceeds threshold
 * @param {number} worked_hours 
 * @param {number} threshold_hours 
 * @returns {boolean}
 */
export function isOvertimeThresholdExceeded(worked_hours, threshold_hours = REGULAR_WORK_HOURS + (20 / 60)) {
    return worked_hours > threshold_hours;
}
