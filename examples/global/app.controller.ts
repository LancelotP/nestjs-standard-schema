import { Body, Controller, Post } from "@nestjs/common";
import { z } from "zod";
import { createStandardSchemaDTO } from "../../dist";

class HelloDTO extends createStandardSchemaDTO(
  z.object({
    name: z.string(),
  }),
) {}

@Controller()
export class AppController {
  @Post("hello")
  sayHello(@Body() body: HelloDTO) {
    return `Hello ${body.name}`;
  }
}
