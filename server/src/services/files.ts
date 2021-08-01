import {
  Connection,
  Range,
  TextDocumentIdentifier,
  TextDocumentPositionParams,
  TextDocuments,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

interface TextDocumentParams {
  textDocument: TextDocumentIdentifier;
}

class TextDocumentFileService {
  readonly documents: TextDocuments<TextDocument>;

  constructor() {
    this.documents = new TextDocuments(TextDocument);
  }

  /**
   * Start listening for document changes.
   *
   * @param connection Connection to the client
   */
  startDocumentListener(connection: Connection): void {
    this.documents.listen(connection);
  }

  /**
   * Retrieves the document from the params, or throws an error if not found.
   *
   * @param uri The URI of the document to fetch
   * @returns
   */
  getDocument(params: TextDocumentParams): TextDocument {
    const doc = this.documents.get(params.textDocument.uri);
    if (!doc) {
      throw new Error('Failed to find document with uri ' + params.textDocument.uri);
    }
    return doc;
  }

  /**
   * Returns a Range for the line that the position is on.
   *
   * @param params Params containing a position
   * @returns The Range
   */
  getLineRange(params: TextDocumentPositionParams): Range {
    return Range.create(params.position.line, 0, params.position.line + 1, 0);
  }

  /**
   * Retrieves the contents of the line in the document at the specified position.
   *
   * @param params Params containing document URI and position
   * @returns The line's contents as a string
   */
  getLine(params: TextDocumentPositionParams): string {
    return this.getDocument(params).getText(this.getLineRange(params));
  }
}

/**
 * Singleton FileService containing document listener
 */
export const FileService = new TextDocumentFileService();
