import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from "@nestjs/common";
import { StandardSchemaV1 } from "@standard-schema/spec";
import {
  getStandardSchemaDTO,
  isStandardSchemaDTO,
} from "./create-standard-schema-dto";

export interface StandardSchemaValidationPipeOptions {
  exceptionFactory?: (issues: readonly StandardSchemaV1.Issue[]) => unknown;
}

@Injectable()
export class StandardSchemaValidationPipe implements PipeTransform {
  constructor(
    private readonly options: StandardSchemaValidationPipeOptions = {},
  ) {}

  async transform(value: unknown, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    if (!isStandardSchemaDTO(metatype)) return value;
    const schema = getStandardSchemaDTO(metatype);

    const result = await schema["~standard"].validate(value);

    if (result.issues) {
      const exception =
        this.options.exceptionFactory?.(result.issues) ??
        this.createException(result.issues);

      throw exception;
    }

    return result.value;
  }

  private createException(issues: readonly StandardSchemaV1.Issue[]) {
    return new BadRequestException(
      issues.map((issue) => {
        const path = issue.path
          ?.map((p) => (typeof p === "object" && !!p ? p.key : p))
          .join(".");

        return {
          message: issue.message,
          path,
        };
      }),
    );
  }
}
