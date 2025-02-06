import { Body, Controller, Post } from "@nestjs/common";
import { createStandardSchemaDTO } from "nestjs-standard-schema";
import { z } from "zod";

class HelloDTO extends createStandardSchemaDTO(
  z.object({
    name: z.string().trim().min(3),
  }),
) {}

@Controller()
export class AppController {
  @Post("hello")
  sayHello(@Body() body: HelloDTO) {
    return `Hello ${body.name}`;
  }
}
