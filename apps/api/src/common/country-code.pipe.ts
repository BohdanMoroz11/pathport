import { BadRequestException, Injectable, type PipeTransform } from "@nestjs/common";

/** ISO-style citizenship (3-letter) and destination (2-letter) codes. */
const COUNTRY_CODE = /^[A-Za-z]{2,3}$/;

/**
 * Validate and normalize a citizenship/destination code path segment. Malformed
 * codes get a 400 (mirroring `ParseUUIDPipe` on route ids) instead of falling
 * through to a misleading 404, and the value is upper-cased so the services
 * match the stored codes without each re-implementing normalization.
 */
@Injectable()
export class CountryCodePipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== "string" || !COUNTRY_CODE.test(value)) {
      throw new BadRequestException(`Malformed country code "${value}".`);
    }
    return value.toUpperCase();
  }
}
