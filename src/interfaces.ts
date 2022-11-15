export interface IUserBody {
    body: {
        id: number,
        username: string,
        password: string,
    }
}

export interface IRequestError {
    body: {
        statusCode: number,
        message: string[],
        error: string,
    }
}