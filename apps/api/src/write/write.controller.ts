import { Body, Controller, Inject, Post } from "@nestjs/common";
import { WriteService } from "./write.service";
import {
  parseCitationBody,
  parseContentBlockBody,
  parseRouteApplicabilityBody,
  parseRouteBody,
  parseSourceDocumentBody,
} from "./write.validation";

/**
 * Local/dev mutation surface for S6. S8 will put the real admin/auth boundary in
 * front of these write use-cases; for now they are deliberately small and
 * validated so the canonical storage can be exercised without hand-written seed
 * edits.
 */
@Controller("local-write")
export class WriteController {
  constructor(@Inject(WriteService) private readonly writes: WriteService) {}

  @Post("content-blocks")
  upsertContentBlock(@Body() body: unknown) {
    this.writes.assertLocalWritesAllowed();
    return this.writes.upsertContentBlock(parseContentBlockBody(body));
  }

  @Post("routes")
  createRoute(@Body() body: unknown) {
    this.writes.assertLocalWritesAllowed();
    return this.writes.createRoute(parseRouteBody(body));
  }

  @Post("route-applicability")
  upsertRouteApplicability(@Body() body: unknown) {
    this.writes.assertLocalWritesAllowed();
    return this.writes.upsertRouteApplicability(parseRouteApplicabilityBody(body));
  }

  @Post("source-documents")
  upsertSourceDocument(@Body() body: unknown) {
    this.writes.assertLocalWritesAllowed();
    return this.writes.upsertSourceDocument(parseSourceDocumentBody(body));
  }

  @Post("citations")
  createCitation(@Body() body: unknown) {
    this.writes.assertLocalWritesAllowed();
    return this.writes.createCitation(parseCitationBody(body));
  }
}
