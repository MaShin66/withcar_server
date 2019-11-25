import cors from 'cors';
import { NextFunction, Response } from 'express';
import { GraphQLServer, PubSub } from 'graphql-yoga';
import helmet from 'helmet';
import logger from 'morgan';
import schema from './schema';
import decodeJWT from './utils/decodeJWT';

class App {
  public app: GraphQLServer;
  public pubSub: any;
  constructor() {
    this.pubSub = new PubSub();
    this.pubSub.ee.setMaxListeners(99);
    this.app = new GraphQLServer({ schema, context: req => {
        const { connection: { context = null } = {} } = req;
        return {
          req: req.request,
          pubSub: this.pubSub,
          context
        };
      }
    });
    this.middlewares();
  }
  
  private middlewares = (): void => {
    this.app.express.use(cors());
    this.app.express.use(logger("dev"));
    this.app.express.use(helmet());
    this.app.express.use(this.jwt);
  };

  // 토큰 관련된 함수
  private jwt = async (req, res: Response, next: NextFunction): Promise<void> => {
    const token = req.get("X-JWT");
    if (token) { // 만약 토큰이 있다면 decodeJWT 함수 실행
      const user = await decodeJWT(token);
      if (user) { // decode 한 토큰과 일치하는 유저가 있다면 반환값으로 유저 정보 보내주고
        req.user = user;
      } else { // 없으면 undefined
        req.user = undefined;
      }
    }
    next();
  };
}

export default new App().app;