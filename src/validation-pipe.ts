import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from "@nestjs/common";
import {
  getStandardSchemaDTO,
  isStandardSchemaDTO,
} from "./create-standard-schema-dto";

@Injectable()
export class StandardSchemaValidationPipe implements PipeTransform {
  async transform(value: unknown, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    if (!isStandardSchemaDTO(metatype)) return value;
    const schema = getStandardSchemaDTO(metatype);

    const result = await schema["~standard"].validate(value);

    if (result.issues) {
      const error = new BadRequestException(
        result.issues.map((issue) => {
          const path = issue.path
            ?.map((p) => (typeof p === "object" && !!p ? p.key : p))
            .join(".");

          return {
            message: issue.message,
            path,
          };
        }),
      );

      throw error;
    }

    return result.value;
  }
}
