// OpenAPI 3.0 specification for helio Events API
export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'helio Events API',
    version: '1.0.0',
    description: 'Interactive API documentation for helio Events backend',
  },
  servers: [
    {
      url: '/api',
      description: 'Current API server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Check API service health',
        responses: {
          200: { description: 'Service operational' },
        },
      },
    },
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Register new account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'alex@example.com' },
                  password: { type: 'string', example: 'password123' },
                  name: { type: 'string', example: 'Alex Morgan' },
                  username: { type: 'string', example: 'alexm' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Account created' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate user and get JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'alex@example.com' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authentication successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Profile details' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/auth/profile': {
      patch: {
        tags: ['Auth'],
        summary: 'Update current user profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  bio: { type: 'string' },
                  website: { type: 'string' },
                  twitterHandle: { type: 'string' },
                  instagramHandle: { type: 'string' },
                  avatarUrl: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/events': {
      get: {
        tags: ['Events'],
        summary: 'List events with filters and pagination',
        parameters: [
          { name: 'timeframe', in: 'query', schema: { type: 'string', enum: ['upcoming', 'past', 'all'] } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'city', in: 'query', schema: { type: 'string' } },
          { name: 'calendarSlug', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'perPage', in: 'query', schema: { type: 'integer', default: 12 } },
        ],
        responses: {
          200: { description: 'List of events' },
        },
      },
      post: {
        tags: ['Events'],
        summary: 'Create a new event',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'description', 'startAt', 'endAt'],
                properties: {
                  name: { type: 'string', example: 'AI Builders Summit 2026' },
                  description: { type: 'string', example: 'A gathering of founders and builders' },
                  startAt: { type: 'string', format: 'date-time' },
                  endAt: { type: 'string', format: 'date-time' },
                  coverUrl: { type: 'string' },
                  locationType: { type: 'string', enum: ['offline', 'online'], default: 'offline' },
                  address: { type: 'string' },
                  city: { type: 'string' },
                  virtualUrl: { type: 'string' },
                  visibility: { type: 'string', enum: ['public', 'private'], default: 'public' },
                  calendarId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Event created' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/events/{slug}': {
      get: {
        tags: ['Events'],
        summary: 'Get single event by slug',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Event details' },
          404: { description: 'Event not found' },
        },
      },
      patch: {
        tags: ['Events'],
        summary: 'Update event by slug',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  startAt: { type: 'string', format: 'date-time' },
                  endAt: { type: 'string', format: 'date-time' },
                  address: { type: 'string' },
                  city: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Event updated' },
          404: { description: 'Event not found' },
        },
      },
    },
    '/events/{id}/guests': {
      get: {
        tags: ['Events'],
        summary: 'Get guest/attendee list for an event',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Guest list' },
        },
      },
    },
    '/events/{id}/register': {
      post: {
        tags: ['Registrations'],
        summary: 'Register for an event',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  name: { type: 'string', example: 'Jordan Lee' },
                  email: { type: 'string', format: 'email', example: 'jordan@example.com' },
                  ticketId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registered successfully' },
          400: { description: 'Registration error' },
        },
      },
    },
    '/registrations/{ticketKey}': {
      get: {
        tags: ['Registrations'],
        summary: 'Get ticket details by ticketKey',
        parameters: [
          { name: 'ticketKey', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Ticket details' },
          404: { description: 'Ticket not found' },
        },
      },
    },
    '/registrations/{id}/status': {
      patch: {
        tags: ['Registrations'],
        summary: 'Update attendee registration status',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['approved', 'rejected', 'checked_in', 'pending'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status updated' },
        },
      },
    },
    '/calendars': {
      get: {
        tags: ['Calendars'],
        summary: 'List all community calendars',
        responses: {
          200: { description: 'List of calendars' },
        },
      },
      post: {
        tags: ['Calendars'],
        summary: 'Create a new calendar',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Tech Founders SG' },
                  description: { type: 'string' },
                  avatarUrl: { type: 'string' },
                  coverUrl: { type: 'string' },
                  tintColor: { type: 'string', default: '#2e72e0' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Calendar created' },
        },
      },
    },
    '/calendars/{slug}': {
      get: {
        tags: ['Calendars'],
        summary: 'Get calendar details and its events by slug',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Calendar details' },
          404: { description: 'Calendar not found' },
        },
      },
      patch: {
        tags: ['Calendars'],
        summary: 'Update calendar by slug',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  tintColor: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Calendar updated' },
        },
      },
    },
    '/categories': {
      get: {
        tags: ['Metadata'],
        summary: 'List event categories',
        responses: {
          200: { description: 'Categories list' },
        },
      },
    },
    '/cities': {
      get: {
        tags: ['Metadata'],
        summary: 'List featured cities',
        responses: {
          200: { description: 'Cities list' },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user (simulated or session)',
        responses: {
          200: { description: 'Current user' },
        },
      },
    },
    '/users/{username}': {
      get: {
        tags: ['Users'],
        summary: 'Get public user profile by username',
        parameters: [
          { name: 'username', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'User profile' },
          404: { description: 'User not found' },
        },
      },
    },
  },
};
