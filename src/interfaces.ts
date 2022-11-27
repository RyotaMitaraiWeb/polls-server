import { Request } from "express"
import { Choice } from "./choice/entities/choice.entity"
import { Poll } from "./poll/entities/poll.entity"


/** Interface for user object that was decoded from a JWT token
 * @property {number} id
 * @property {string} username
 */
export interface DecodedToken {
    id: number,
    username: string,
}

/**Extends the Request interface from Express with these additional properties (which are attached via middlewares):
 * @property {DecodedToken} user - user object decoded from a JWT token
 * @property {boolean} isAuthor - indicates whether the user sending the request is the author of the entry or not
 * @property {Poll} poll - this is the poll to which the request is made
 * @property {boolean} isLogged - indicates whether the user is logged in or a guest
 * @property {boolean} hasVoted - indicates whether the user has voted in the poll. Defaults to false if the user is a guest
 * @property {number} voteId - the id of the choice that the user has voted, or -1 if the user has not voted or is a guest
 */
export interface IRequest extends Request {
    user: DecodedToken,
    isAuthor: boolean,
    poll: Poll,
    isLogged: boolean,
    hasVoted: boolean,
    voteId: number,
}

/* INTERFACES FOR TESTS */

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
        creationDate: Date,
        updateDate: Date,
    }
}

export interface IUserBody {
    body: {
        id: number,
        username: string,
        accessToken: string,
    }
}

export interface IVoteCount {
    content: string,
    id: number,
    count: number
}

export interface IRequestError {
    body: {
        status: number,
        message: string,
        response: string,
        error: string,
    }
}