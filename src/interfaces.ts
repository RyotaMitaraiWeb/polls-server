import { Request } from "express"

export interface IUserBody {
    body: {
        id: number,
        username: string,
        accessToken: string,
    },
}

export interface IRequestError {
    body: {
        statusCode: number,
        message: string[],
        error: string,
    }
}

export interface DecodedToken {
    id: number,
    username: string,
}

export interface IRequest extends Request {
    username: string,
    password: string,
    user: DecodedToken,
}