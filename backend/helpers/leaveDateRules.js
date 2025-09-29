/**
 * Validates leave dates based on the type of leave.
 * 
 * @param {Object} leave_type - The leave type object containing at least a `name` property.
 * @param {string|Date} start_date - The start date of the leave.
 * @param {string|Date} end_date - The end date of the leave.
 * @param {Date} [today=new Date()] - The current date. Defaults to today's date.
 * @returns {Object} An object with `status` (boolean) and `error` (string|null) properties.
 * - If valid: `{ status: true }`
 * - If invalid: `{ status: false, error: string }`
 * @author Rod
 * @lastupdated September 26, 2025
 */
export function validateLeaveDates(leave_type, start_date, end_date, today = new Date()) {
    const start = new Date(start_date);
    const end = new Date(end_date);

    if (leave_type.name.toLowerCase() === "sick leave") {
        if (start > today || end > today) {
            return {
                status: false,
                error: "Sick Leave cannot be filed for future dates."
            };
        }
    } else {
        if (end < today) {
            return {
                status: false,
                error: `${leave_type.name} cannot be filed for past dates.`
            };
        }
        if (end < start) {
            return { status: false, error: "End date cannot be earlier than start date." };
        }
    }

    return { status: true }; 
}
