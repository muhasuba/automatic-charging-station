import { Router, Response, Request } from "express";

export class ScriptController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  public parser = async (req: Request, res: Response) => {
    const { script } = req.body;
    let { separator } = req.body;
    console.log("body", JSON.stringify(req.body));

    if (!separator) {
      separator = "\n";
    }

    const listScript = script.toLowerCase().split(separator);

    if (
      listScript[0] != "begin" ||
      listScript[listScript.length - 1] != "end"
    ) {
      res.status(400).send("Invalid script");
      return;
    }

    const result = { listScript };

    res.status(200).json({
      result,
    });
  };

  public routes() {
    this.router.post("/parser", this.parser);
  }
}
