"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_STATUS_TRANSITIONS = void 0;
exports.canTransitionInvoice = canTransitionInvoice;
exports.ALLOWED_STATUS_TRANSITIONS = {
    draft: ['issued'],
    issued: ['paid', 'void'],
    paid: [],
    void: [],
};
function canTransitionInvoice(currentStatus, newStatus) {
    return exports.ALLOWED_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}
//# sourceMappingURL=invoice-status.js.map