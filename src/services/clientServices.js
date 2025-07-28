// ----------------  SERVICES or QUERIES

import { query } from "../db.js";

// Fetching all clients
export const getClients = async () => {
  const { rows } = await query(
    "SELECT * FROM client_tbl ORDER BY client_id ASC"
  );
  return rows;
};

// Adding a new client
export const createClient = async (clientData) => {
  const { client_fullname, client_email, client_phonenum, created_by } =
    clientData;
  const { rows } = await query(
    "INSERT INTO client_tbl (client_fullname, client_email, client_phonenum, created_by) VALUES ($1, $2, $3, $4) RETURNING *",
    [client_fullname, client_email, client_phonenum, created_by]
  );
  return rows[0];
};

// Updating an existing client
export const updateClient = async (clientId, clientData) => {
  const { client_fullname, client_email, client_phonenum } = clientData;
  const { rows } = await query(
    "UPDATE client_tbl SET client_fullname = $1, client_email = $2, client_phonenum = $3 WHERE client_id = $4 RETURNING *",
    [client_fullname, client_email, client_phonenum, clientId]
  );
  return rows[0];
};

// Deleting a client by ID
export const deleteClientById = async (clientId) => {
  const { rows } = await query(
    "DELETE FROM client_tbl WHERE client_id = $1 RETURNING *",
    [clientId]
  );
  return rows[0];
};

// Searching for a client
export const searchClients = async (searchTerm) => {
  const { rows } = await query(
    "SELECT * FROM client_tbl WHERE client_fullname ILIKE $1 OR client_email ILIKE $1 OR client_phonenum ILIKE $1",
    [`%${searchTerm}%`]
  );
  return rows;
};

// ---------------- SERVICES OR QUERIES FOR CLIENT CONTACTS

// Fetching all client contacts
export const getClientContacts = async () => {
  const { rows } = await query(
    "SELECT * FROM client_contact_tbl ORDER BY contact_id"
  );
  return rows;
};

// Adding a new client contact
export const createClientContact = async (contactData) => {
  const { contact_fullname, contact_email, contact_phone, contact_role, client_id } = contactData;
  const { rows } = await query(
    "INSERT INTO client_contact_tbl (contact_fullname, contact_email, contact_phone, contact_role, client_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [contact_fullname, contact_email, contact_phone, contact_role, client_id]
  );
  return rows[0];
};

// Updating an existing client contact
export const updateClientContact = async (contact_id, contactData) => {
  const { contact_fullname, contact_email, contact_phone, contact_role } = contactData;
  const { rows } = await query(
    "UPDATE client_contact_tbl SET contact_fullname = $1, contact_email = $2, contact_phone = $3, contact_role = $4 WHERE contact_id = $5 RETURNING *",
    [contact_fullname, contact_email, contact_phone, contact_role, contact_id]
  );
  return rows[0];
};

// Deleting a client contact by ID
export const deleteClientContactById = async (contact_id) => {
  const { rows } = await query(
    "DELETE FROM client_contact_tbl WHERE cc_id = $1 RETURNING *",
    [contact_id]
  );
  return rows[0];
};

// searching for client contacts
export const searchClientContacts = async (searchTerm) => {
  const { rows } = await query(
    "SELECT * FROM client_contact_tbl WHERE contact_fullname ILIKE $1 OR contact_email ILIKE $1 OR contact_phone ILIKE $1",
    [`%${searchTerm}%`]
  );
  return rows;
};
