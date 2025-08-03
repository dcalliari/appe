# Appê 🏢

A full-stack TypeScript monorepo for a modern condominium management application, built with Bun, Hono, Vite, and React.

## About

`Appê` is a comprehensive solution for managing condominium daily operations. It provides a platform for residents, administration, and staff to interact seamlessly. From booking spaces to managing visitors, `Appê` aims to modernize and simplify condo living.

## Features

- **Full-Stack TypeScript**: End-to-end type safety between client and server.
- **Monorepo Structure**: Organized as a workspaces-based monorepo with Turbo for build orchestration.
- **User Authentication**: Secure login for residents and staff.
- **Notice Board**: A central place for announcements and important information.
- **Document Management**: Share and access important documents like meeting minutes or regulations.
- **Visitor Control**: Pre-authorize and manage guest access.
- **Space Bookings**: Easily book common areas like party halls or barbecue pits.
- **Concierge Chat**: Real-time communication with the building's concierge.
- **Modern Stack**:
  - [Bun](https://bun.sh) as the JavaScript runtime and package manager
  - [Hono](https://hono.dev) as the backend framework
  - [Drizzle ORM](https://orm.drizzle.team/) for database access
  - [Vite](https://vitejs.dev) for frontend bundling
  - [React](https://react.dev) for the frontend UI
  - [shadcn/ui](https://ui.shadcn.com) for UI components
  - [Turbo](https://turbo.build) for monorepo build orchestration and caching

## Project Structure

```
.
├── client/               # React frontend (Vite)
├── server/               # Hono backend (Node.js/Bun)
├── shared/               # Shared TypeScript definitions
│   └── src/types/        # Type definitions used by both client and server
├── package.json          # Root package.json with workspaces
└── turbo.json            # Turbo configuration for build orchestration
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/docs/installation)

### Installation

```bash
# Install dependencies for all workspaces
bun install
```

### Development

```bash
# Run all workspaces in development mode with Turbo
bun run dev

# Or run individual workspaces directly
bun run dev:client    # Run the Vite dev server for React
bun run dev:server    # Run the Hono backend
```

### Building

```bash
# Build all workspaces with Turbo
bun run build

# Or build individual workspaces directly
bun run build:client  # Build the React frontend
bun run build:server  # Build the Hono backend
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
