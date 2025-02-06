# nestjs-standard-schema

A flexible validation pipe for NestJS that leverages [@standard-schema](https://github.com/standard-schema/standard-schema) to support multiple validation libraries like Zod, Valibot, ArkType and more.

## Features

- 🔄 Drop-in replacement for NestJS's ValidationPipe
- 🎯 Support for multiple validation libraries (Zod, Valibot, ArkType, etc.)
- 🚀 Easy integration with existing NestJS applications
- 📦 Lightweight with minimal dependencies

## Installation

### Using npm

```bash
npm install nestjs-standard-schema
```

### Using yarn

```bash
yarn add nestjs-standard-schema
```

### Using pnpm

```bash
pnpm add nestjs-standard-schema
```

## Quick Start

1. Create your DTO using your preferred validation library (example with Zod):

```typescript
import { z } from 'zod';
import { createStandardSchemaDTO } from 'nestjs-standard-schema';

const createUserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

export const CreateUserDTO = createStandardSchemaDTO(createUserSchema);
```

2. Use the `CreateUserDTO` in your NestJS application:

```typescript

import { Controller, Post, Body } from '@nestjs/common';
import { StandardSchemaValidationPipe } from 'nestjs-standard-schema';

@Controller('users')
export class UsersController {
  @Post()
  createUser(@Body(new StandardSchemaValidationPipe()) user: CreateUserDTO) {
    return user;
  }
}
```

## Global Usage

To use the validation pipe globally, register it in your app module:

```typescript
import { StandardSchemaValidationPipe } from 'nestjs-standard-schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new StandardSchemaValidationPipe());

  await app.listen(3000);
}
bootstrap();
```

## Roadmap

- [ ] Support for all ValidationPipe options from @nestjs/common
- [ ] Custom error messages
- [ ] Transform options
- [ ] Whitelist/strip options
- [ ] Detailed validation error messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [NestJS](https://nestjs.com/) - The progressive Node.js framework
- [@standard-schema](https://github.com/standard-schema/standard-schema) - Standard Schema specification