export class NextResponse {
  static next() {
    return { status: 200 };
  }
  static redirect(url) {
    return { status: 307, headers: { Location: url } };
  }
}
