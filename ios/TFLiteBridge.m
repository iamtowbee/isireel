#import "TFLiteBridge.h"
#import <React/RCTLog.h>

// TensorFlow Lite will be linked via CocoaPods
// #import "TensorFlowLiteC/TensorFlowLiteC.h"

@implementation TFLiteBridge

RCT_EXPORT_MODULE(TFLite);

// Load a TFLite model
RCT_EXPORT_METHOD(loadModel:(NSString *)modelPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    // Check if file exists
    NSFileManager *fileManager = [NSFileManager defaultManager];
    if (![fileManager fileExistsAtPath:modelPath]) {
      reject(@"FILE_NOT_FOUND", @"Model file not found", nil);
      return;
    }

    // For now, just return success
    // Full TFLite integration requires TensorFlowLiteC framework
    resolve(@{
      @"success": @YES,
      @"modelPath": modelPath,
      @"message": @"Model loaded (native TFLite integration pending)"
    });
  } @catch (NSException *exception) {
    reject(@"LOAD_ERROR", exception.reason, nil);
  }
}

// Run inference
RCT_EXPORT_METHOD(runInference:(NSString *)modelPath
                  inputData:(NSArray *)inputData
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    // Placeholder for TFLite inference
    // This will be implemented with actual TFLite C API

    NSMutableArray *output = [NSMutableArray array];
    for (int i = 0; i < 10; i++) {
      [output addObject:@(arc4random_uniform(100) / 100.0)];
    }

    resolve(@{
      @"output": output,
      @"inferenceTime": @(15.5),
      @"message": @"Mock inference (native TFLite pending)"
    });
  } @catch (NSException *exception) {
    reject(@"INFERENCE_ERROR", exception.reason, nil);
  }
}

// Get model info
RCT_EXPORT_METHOD(getModelInfo:(NSString *)modelPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    // Mock model info
    resolve(@{
      @"inputShape": @[@1, @224, @224, @3],
      @"outputShape": @[@1, @1000],
      @"inputType": @"float32",
      @"outputType": @"float32"
    });
  } @catch (NSException *exception) {
    reject(@"INFO_ERROR", exception.reason, nil);
  }
}

@end
