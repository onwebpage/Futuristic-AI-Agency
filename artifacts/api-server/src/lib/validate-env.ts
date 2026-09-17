/**
 * Environment Variable Validation
 * 
 * Validates critical environment variables at server startup
 * to prevent runtime errors due to misconfiguration.
 */

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ===== Port Configuration =====
  if (!process.env.PORT) {
    errors.push("PORT environment variable is required");
  } else if (isNaN(Number(process.env.PORT))) {
    errors.push(`PORT must be a number, got: ${process.env.PORT}`);
  }

  // ===== JWT Secrets =====
  if (process.env.NODE_ENV === "production") {
    if (!process.env.SESSION_SECRET) {
      errors.push("SESSION_SECRET must be set in production for admin authentication");
    } else if (process.env.SESSION_SECRET.length < 32) {
      warnings.push("SESSION_SECRET should be at least 32 characters for security");
    }

    if (!process.env.USER_SESSION_SECRET) {
      errors.push("USER_SESSION_SECRET must be set in production for user authentication");
    } else if (process.env.USER_SESSION_SECRET.length < 32) {
      warnings.push("USER_SESSION_SECRET should be at least 32 characters for security");
    }
  } else {
    if (!process.env.SESSION_SECRET) {
      warnings.push("SESSION_SECRET not set - using development default");
    }
    if (!process.env.USER_SESSION_SECRET) {
      warnings.push("USER_SESSION_SECRET not set - using development default");
    }
  }

  // ===== Supabase Configuration =====
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    errors.push("Supabase URL is required. Set SUPABASE_URL or VITE_SUPABASE_URL");
  } else if (!supabaseUrl.startsWith("https://") || !supabaseUrl.includes(".supabase.co")) {
    errors.push(`Invalid Supabase URL format: ${supabaseUrl}`);
  }

  if (!supabaseKey) {
    errors.push("Supabase service role key is required. Set SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY");
  } else {
    // Validate key format
    if (!supabaseKey.startsWith("eyJ")) {
      errors.push("Supabase key appears invalid - service_role keys should start with 'eyJ' (JWT format)");
    }
    
    // Check if using the wrong key (anon key instead of service_role)
    if (process.env.VITE_SUPABASE_PUBLISHABLE_KEY && 
        supabaseKey === process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
      errors.push(
        "CRITICAL: Using VITE_SUPABASE_PUBLISHABLE_KEY as service key! " +
        "This is an anon key with limited permissions. " +
        "Set SUPABASE_SECRET_KEY with the service_role key instead."
      );
    }

    // Warn if service key is exposed in frontend variables
    if (supabaseKey && supabaseKey === process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
      errors.push("Service role key is set to the same value as the publishable key - this is incorrect");
    }
  }

  // ===== PayPal Configuration (warnings only) =====
  if (!process.env.PAYPAL_CLIENT_ID) {
    warnings.push("PAYPAL_CLIENT_ID not set - payment features will not work");
  }
  if (!process.env.PAYPAL_CLIENT_SECRET) {
    warnings.push("PAYPAL_CLIENT_SECRET not set - payment features will not work");
  }

  // ===== CORS Configuration =====
  if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGINS) {
    warnings.push("CORS_ORIGINS not set in production - using defaults may cause CORS issues");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function logValidationResults(result: ValidationResult): void {
  if (result.warnings.length > 0) {
    console.warn("=".repeat(80));
    console.warn("⚠️  ENVIRONMENT CONFIGURATION WARNINGS");
    console.warn("=".repeat(80));
    result.warnings.forEach((warning, i) => {
      console.warn(`${i + 1}. ${warning}`);
    });
    console.warn("=".repeat(80));
  }

  if (result.errors.length > 0) {
    console.error("=".repeat(80));
    console.error("❌ ENVIRONMENT CONFIGURATION ERRORS");
    console.error("=".repeat(80));
    result.errors.forEach((error, i) => {
      console.error(`${i + 1}. ${error}`);
    });
    console.error("=".repeat(80));
    console.error("🛑 Server cannot start with configuration errors.");
    console.error("=".repeat(80));
  }

  if (result.valid && result.warnings.length === 0) {
    console.log("✅ Environment configuration validated successfully");
  }
}
