import { BadRequestException } from "@nestjs/common";
import { StandardSchemaV1 } from "@standard-schema/spec";
import { type } from "arktype";
import * as valibot from "valibot";
import { describe, expect, test } from "vitest";
import { z } from "zod";
import { createStandardSchemaDTO } from "./create-standard-schema-dto";
import {
  StandardSchemaValidationPipe,
  StandardSchemaValidationPipeOptions,
} from "./validation-pipe";

const zodSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().min(18),
  address: z.object({
    country: z.string(),
  }),
});

const valibotSchema = valibot.object({
  username: valibot.pipe(
    valibot.string(),
    valibot.trim(),
    valibot.minLength(3),
    valibot.maxLength(20),
  ),
  email: valibot.pipe(valibot.string(), valibot.email()),
  password: valibot.pipe(valibot.string(), valibot.minLength(8)),
  age: valibot.pipe(valibot.number(), valibot.minValue(18)),
  address: valibot.object({
    country: valibot.string(),
  }),
});

const arktypeSchema = type({
  username: "3 <= string <= 20",
  email: "string.email",
  password: "string >= 8",
  age: "number >= 18",
  address: {
    country: "string",
  },
});

const schemas: { vendor: string; schema: StandardSchemaV1 }[] = [
  { vendor: "zod", schema: zodSchema },
  { vendor: "valibot", schema: valibotSchema },
  { vendor: "arktype", schema: arktypeSchema },
];

describe("ValidationPipe", () => {
  test("should be defined", () => {
    expect(new StandardSchemaValidationPipe()).toBeDefined();
  });

  test("should passthrough undefined metatype", async () => {
    const pipe = new StandardSchemaValidationPipe();

    const input = { foo: "bar" };

    await expect(pipe.transform(input, { type: "body" })).resolves.toBe(input);
  });

  test("should passthrough unknown metatype", async () => {
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

  for (const { vendor, schema } of schemas) {
    // @ts-expect-error - This is a valid use of createStandardSchemaDTO
    class SampleDTO extends createStandardSchemaDTO(schema) {}

    describe(`${vendor} schema`, () => {
      test("should validate and return a POJO", async () => {
        const pipe = new StandardSchemaValidationPipe();

        const input = {
          username: "John",
          email: "john@example.com",
          password: "password",
          age: 20,
          address: {
            country: "Internet",
          },
        };

        const expected = {
          username: "John",
          email: "john@example.com",
          password: "password",
          age: 20,
          address: {
            country: "Internet",
          },
        };

        await expect(
          pipe.transform(input, { type: "body", metatype: SampleDTO }),
        ).resolves.toEqual(expected);
      });

      test("should throw a BadRequestException when validation fails", async () => {
        const pipe = new StandardSchemaValidationPipe();

        const input = {
          username: "12",
          email: "johnexample.com",
          password: "123123123123131312312313",
          age: 17,
        };

        let error: BadRequestException;

        try {
          await pipe.transform(input, { type: "body", metatype: SampleDTO });
        } catch (e) {
          error = e as BadRequestException;
        }

        // @ts-expect-error -
        expect(error.getResponse().message).toEqual(
          expect.arrayContaining([
            {
              message: expect.any(String),
              path: "username",
            },
            {
              message: expect.any(String),
              path: "email",
            },
            {
              message: expect.any(String),
              path: "age",
            },
          ]),
        );
      });
    });
  }

  describe("options", () => {
    describe("exceptionFactory", () => {
      test("should use the exception factory if provided", async () => {
        class CustomException extends Error {}

        await expect(
          run(
            z.object({ username: z.string() }),
            {},
            {
              exceptionFactory: () => new CustomException(),
            },
          ),
        ).rejects.toThrow(CustomException);
      });

      test("should throw a BadRequestException if no exception factory is provided", async () => {
        await expect(
          run(z.object({ username: z.string() }), {}),
        ).rejects.toThrowError(BadRequestException);
      });
    });
  });
});

async function run(
  schema: StandardSchemaV1<unknown, object>,
  input: unknown,
  options?: StandardSchemaValidationPipeOptions,
) {
  const pipe = new StandardSchemaValidationPipe(options);

  return pipe.transform(input, {
    type: "body",
    metatype: createStandardSchemaDTO(schema),
  });
}
