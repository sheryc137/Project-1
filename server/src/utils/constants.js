const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const ROLES = {
  STUDENT: 'student',
  DRIVER: 'driver',
  ADMIN: 'admin',
};

const PEPPERDINE_EMAIL_REGEX = /^[\w.+-]+@pepperdine\.edu$/;

const PEPPERDINE_BUILDINGS = [
  'Tyler Campus Center',
  'Payson Library',
  'Towers Residence Hall',
  'Lovernich Residential Complex',
  'Seaside Residence Hall',
  'George Page Hall',
  'Elkins Auditorium',
  'Appleby Center',
  'Brock House',
  'Firestone Fieldhouse',
  'Pendleton Learning Center',
  'Keck Science Center',
  'Rockwell Academic Center',
  'Huntsinger Academic Center',
  'Joslyn Plaza',
  'Alumni Park',
];

module.exports = { ORDER_STATUS, ROLES, PEPPERDINE_EMAIL_REGEX, PEPPERDINE_BUILDINGS };
