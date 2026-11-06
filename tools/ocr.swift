import Foundation
import Vision
import AppKit
let dir = CommandLine.arguments[1]
var output: [[String: Any]] = []
let files = try FileManager.default.contentsOfDirectory(atPath: dir).filter { $0.hasSuffix(".jpeg") }.sorted { $0.compare($1, options: .numeric) == .orderedAscending }
for file in files {
 let url = URL(fileURLWithPath: dir).appendingPathComponent(file)
 let request = VNRecognizeTextRequest()
 request.recognitionLevel = .accurate
 request.recognitionLanguages = ["en-US"]
 request.usesLanguageCorrection = true
 try VNImageRequestHandler(url: url).perform([request])
 let lines = (request.results ?? []).compactMap { r -> [String: Any]? in
 guard let t = r.topCandidates(1).first else { return nil }
 return ["text":t.string,"x":r.boundingBox.minX,"y":r.boundingBox.minY,"w":r.boundingBox.width,"h":r.boundingBox.height]
 }
 output.append(["file":file,"lines":lines])
 fputs("\(file): \(lines.count) lines\n", stderr)
}
let data = try JSONSerialization.data(withJSONObject: output, options: [.prettyPrinted,.sortedKeys])
try data.write(to: URL(fileURLWithPath: "data/ocr.json"))
