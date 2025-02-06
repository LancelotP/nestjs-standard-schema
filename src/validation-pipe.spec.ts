import { BadRequestException } from "@nestjs/common";
import { StandardSchemaV1 } from "@standard-schema/spec";
import { type } from "arktype";
import * as valibot from "valibot";
import { describe, expect, test } from "vitest";
import { z } from "zod";
import { createStandardSchemaDTO } from "./create-standard-schema-dto";
import { StandardSchemaValidationPipe } from "./validation-pipe";

const zodSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().min(18),
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
});

const arktypeSchema = type({
  username: "3 <= string <= 20",
  email: "string.email",
  password: "string >= 8",
  age: "number >= 18",
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
        };

        const expected = {
          username: "John",
          email: "john@example.com",
          password: "password",
          age: 20,
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
});
