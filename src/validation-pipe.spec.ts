import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { IsNumber, IsString } from "class-validator";
import { z } from "zod";
import { createStandardSchemaDTO } from "./create-standard-schema-dto";
import { StandardSchemaValidationPipe } from "./validation-pipe";
const zodSchema = z.object({
  name: z.string(),
  age: z.number(),
});

describe("ValidationPipe", () => {
  it("should be defined", () => {
    expect(new StandardSchemaValidationPipe()).toBeDefined();
  });

  it("should passthrough undefined metatype", async () => {
    const pipe = new StandardSchemaValidationPipe();

    const input = { foo: "bar" };

    await expect(pipe.transform(input, { type: "body" })).resolves.toBe(input);
  });

  it("should passthrough unknown metatype", async () => {
    const pipe = new StandardSchemaValidationPipe();

    const input = { foo: "bar" };

    class TestClass {
      sample() {
        return "test";
      }
    }

    await expect(
      pipe.transform(input, { type: "body", metatype: TestClass }),
    ).resolves.toBe(input);
  });

  it("should validate and return a POJO", async () => {
    const pipe = new StandardSchemaValidationPipe();

    const input = { name: "John", age: 20 };

    await expect(
      pipe.transform(input, { type: "body", metatype: ZodPostDTO }),
    ).resolves.toEqual(input);
  });

  it("should throw a BadRequestException when validation fails", async () => {
    const pipe = new StandardSchemaValidationPipe();

    const input = { name: "John", age: "20" };

    await expect(
      pipe.transform(input, { type: "body", metatype: ZodPostDTO }),
    ).rejects.toThrow(
      new BadRequestException([
        {
          message: "Invalid input",
        },
      ]),
    );
  });
});

class ZodPostDTO extends createStandardSchemaDTO(zodSchema) {}

class PostDTO {
  @IsString()
  name!: string;

  @IsNumber()
  age!: number;
}

@Controller("posts")
class PostController {
  @Post("zod")
  async zod(@Body() postDTO: ZodPostDTO) {
    return postDTO;
  }
}
