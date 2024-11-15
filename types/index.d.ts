import { IUser } from '../models/User'; // Adjust path as necessary

declare global {
    namespace Express {
        interface Request {
            decoded?: { userId: string };
            user?: IUser; // Make user optional in case it's not defined
        }
    }
}
