import Vision
import Foundation
import UIKit

@objc(OCRService)
class OCRService: NSObject {

  static let shared = OCRService()

  private var screenshotMonitoringActive = false
  private var onScreenshotCallback: ((String) -> Void)?

  // MARK: - Public Methods

  /// Process image and extract text via Vision framework
  @objc
  func processImage(
    _ imagePath: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.global(qos: .userInitiated).async {
      guard let image = UIImage(contentsOfFile: imagePath) else {
        reject("IMAGE_ERROR", "Could not load image from path: \(imagePath)", nil)
        return
      }

      guard let cgImage = image.cgImage else {
        reject("IMAGE_ERROR", "Could not get CGImage from UIImage", nil)
        return
      }

      self.recognizeText(from: cgImage) { result in
        switch result {
        case .success(let textResults):
          resolve(textResults)
        case .failure(let error):
          reject("OCR_ERROR", error.localizedDescription, error)
        }
      }
    }
  }

  /// Start monitoring for screenshots
  @objc
  func startMonitoring(
    _ resolve: RCTPromiseResolveBlock,
    reject: RCTPromiseRejectBlock
  ) {
    guard !screenshotMonitoringActive else {
      reject("MONITORING_ERROR", "Screenshot monitoring already active", nil)
      return
    }

    screenshotMonitoringActive = true

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(userDidTakeScreenshot),
      name: UIApplication.userDidTakeScreenshotNotification,
      object: nil
    )

    print("✓ Screenshot monitoring started")
    resolve(true)
  }

  /// Stop monitoring for screenshots
  @objc
  func stopMonitoring(
    _ resolve: RCTPromiseResolveBlock,
    reject: RCTPromiseRejectBlock
  ) {
    guard screenshotMonitoringActive else {
      reject("MONITORING_ERROR", "Screenshot monitoring is not active", nil)
      return
    }

    screenshotMonitoringActive = false
    NotificationCenter.default.removeObserver(
      self,
      name: UIApplication.userDidTakeScreenshotNotification,
      object: nil
    )

    print("✓ Screenshot monitoring stopped")
    resolve(true)
  }

  /// Capture current screen
  @objc
  func captureScreenshot(
    _ resolve: RCTPromiseResolveBlock,
    reject: RCTPromiseRejectBlock
  ) {
    guard let window = UIApplication.shared.windows.first else {
      reject("SCREENSHOT_ERROR", "Could not find main window", nil)
      return
    }

    let renderer = UIGraphicsImageRenderer(bounds: window.bounds)
    let screenshot = renderer.image { context in
      window.drawHierarchy(in: window.bounds, afterScreenUpdates: false)
    }

    guard let imageData = screenshot.pngData() else {
      reject("SCREENSHOT_ERROR", "Could not generate PNG data", nil)
      return
    }

    // Save to temp directory
    let tmpDirectory = FileManager.default.temporaryDirectory
    let fileName = "screenshot_\(Date().timeIntervalSince1970).png"
    let imagePath = tmpDirectory.appendingPathComponent(fileName)

    do {
      try imageData.write(to: imagePath)
      print("✓ Screenshot saved to: \(imagePath.path)")
      resolve(imagePath.path)
    } catch {
      reject("SCREENSHOT_ERROR", "Could not save screenshot: \(error.localizedDescription)", error)
    }
  }

  // MARK: - Private Methods

  @objc
  private func userDidTakeScreenshot() {
    print("📸 Screenshot detected")

    // Small delay to ensure screenshot is fully captured
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
      self?.captureScreenshot({ imagePath in
        if let path = imagePath as? String {
          self?.onScreenshotCallback?(path)
        }
      }, reject: { _, _, _ in
        print("Failed to capture screenshot")
      })
    }
  }

  /// Perform OCR using Vision framework
  private func recognizeText(
    from cgImage: CGImage,
    completion: @escaping (Result<[[String: Any]], Error>) -> Void
  ) {
    let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])

    let recognizeTextRequest = VNRecognizeTextRequest { request, error in
      if let error = error {
        completion(.failure(error))
        return
      }

      var recognizedStrings: [[String: Any]] = []

      guard let results = request.results as? [VNRecognizedTextObservation] else {
        completion(.success([]))
        return
      }

      for observation in results {
        guard let topCandidate = observation.topCandidates(1).first else {
          continue
        }

        let text = topCandidate.string
        let confidence = observation.confidence

        recognizedStrings.append([
          "text": text,
          "confidence": Double(confidence)
        ])

        print("📝 Recognized: '\(text)' (confidence: \(String(format: "%.2f", confidence)))")
      }

      completion(.success(recognizedStrings))
    }

    // Configure for English text
    recognizeTextRequest.recognitionLanguages = ["en-US"]
    recognizeTextRequest.usesLanguageCorrection = true

    DispatchQueue.global(qos: .userInitiated).async {
      do {
        try requestHandler.perform([recognizeTextRequest])
      } catch {
        completion(.failure(error))
      }
    }
  }
}

// MARK: - React Native Bridge

@objc(OCRServiceBridge)
class OCRServiceBridge: NSObject {

  var methodQueue = DispatchQueue(label: "com.uberfiler.ocrservice")

  @objc
  func processImage(
    _ imagePath: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    OCRService.shared.processImage(imagePath, resolve: resolve, reject: reject)
  }

  @objc
  func startMonitoring(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    OCRService.shared.startMonitoring(resolve, reject: reject)
  }

  @objc
  func stopMonitoring(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    OCRService.shared.stopMonitoring(resolve, reject: reject)
  }

  @objc
  func captureScreenshot(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    OCRService.shared.captureScreenshot(resolve, reject: reject)
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
