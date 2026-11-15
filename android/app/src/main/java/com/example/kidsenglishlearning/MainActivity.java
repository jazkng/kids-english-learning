package com.example.kidsenglishlearning;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Hardware back steps through the web app's history screens (lesson -> list -> home)
        // without adding the @capacitor/app dependency; at the first screen it exits normally.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });
    }

    @Override
    public void onPause() {
        super.onPause();
        // 👑 Belt-and-braces with the web visibilitychange handler: narration must stop when the app is backgrounded.
        if (getBridge() != null) {
            getBridge().getWebView().evaluateJavascript("document.querySelectorAll('audio').forEach(a=>a.pause())", null);
        }
    }
}
