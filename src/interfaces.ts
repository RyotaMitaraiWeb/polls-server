import { Request } from "express"
import { Choice } from "./choice/entities/choice.entity"
import { Poll } from "./poll/entities/poll.entity"
import { User } from "./user/entities/user.entity"

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
    body: {
        choices: string[],
    },
    isAuthor: boolean,
    poll: Poll,
    isLogged: boolean,
    hasVoted: boolean,
    voteId: number,
}

export interface IVoteCount {
    content: string,
    id: number,
    count: number
}

export interface IPollBody {
    body: {
        id: number,
        title: string,
        description: string,
        choices: Choice[],
        author: string,
        previousTitles: string[],
        isAuthor: boolean,
        hasVoted: boolean,
        voteCount: IVoteCount[],
        voteId: number,
    }
}